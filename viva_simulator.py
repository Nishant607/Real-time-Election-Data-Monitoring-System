import os
import json
import time
import csv
import urllib.request
import urllib.error
import random
from datetime import datetime, timedelta, timezone

# --- SUPABASE CREDENTIALS DIRECTORY LOAD ---
SUPA_URL = "https://lisryqeqsdhpwdhbtibw.supabase.co/rest/v1"
SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc3J5cWVxc2RocHdkaGJ0aWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjQzOTQsImV4cCI6MjA5MTE0MDM5NH0.qY45_Oj6uxH8674LWJZYivRBS-ThJXBffQ2LyvvKjuQ"

HEADERS = {
    "apikey": SUPA_KEY,
    "Authorization": f"Bearer {SUPA_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def supabase_request(endpoint, method="GET", data=None):
    url = f"{SUPA_URL}/{endpoint}"
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.getcode() in [200, 201, 204]:
                res = response.read().decode('utf-8')
                return json.loads(res) if res else []
            return []
    except urllib.error.HTTPError as e:
        print(f"Supabase HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        return []
    except Exception as ex:
        print(f"Supabase Connection Error: {ex}")
        return []

def clear_old_data():
    print('[-] Wiping old Demo Data from the servers... Please wait...')
    supabase_request("vote_records?id=gte.0", method="DELETE")
    supabase_request("alerts?id=gte.0", method="DELETE")
    # Optional wait block for safety
    time.sleep(1)
    print('[✔] Dashboard Data Reset to ZERO!\n')

def run_simulator():
    print("\n=======================================================")
    print(" VIVA EXAMINATION: LIVE ELECTION SIMULATOR ")
    print("=======================================================\n")

    clear_data = input("[?] Do you want to WIPE old demo data from Dashboard to start fresh? (y/n): ")
    if clear_data.lower() == 'y':
        clear_old_data()

    input("\n[!] EXAMINER WAITING: Open your Live Dashboard in the browser now.\n[>>] PRESS THE 'ENTER' KEY HERE WHEN YOU ARE READY TO START THE LIVE STREAM... ")
    print("\n[>>] Generating Live Action Stream (15 Seconds Animation)...\n")
    
    # 15 seconds long presentation loop
    TOTAL_TICKS = 15  
    
    # Start fake timestamps 3 hours ago to accommodate the data streaming
    sim_time = datetime.now(timezone.utc) - timedelta(hours=3)
    
    # Fetch all candidates dynamically so anyone added gets votes!
    candidates_list = supabase_request("candidates?select=id,name")
    if not candidates_list:
        print("[!] Error, no candidates found. Please add candidates first.")
        return
        
    candidate_ids = [c['id'] for c in candidates_list]
    
    totals = {cid: 3000 for cid in candidate_ids}
    
    # Distribute fraud randomly to make it look realistic for any number of candidates
    fraud_ticks = {
        4: candidate_ids[0 % len(candidate_ids)],
        8: candidate_ids[1 % len(candidate_ids)],
        12: candidate_ids[0 % len(candidate_ids)],
        14: candidate_ids[2 % len(candidate_ids)] if len(candidate_ids) > 2 else candidate_ids[1 % len(candidate_ids)]
    }
    
    dataset = []

    print(f"[System]: Submitting Base Floor of 3000 Votes for {len(candidate_ids)} candidates To Avoid DB Math Errors...")
    for cid in candidate_ids:
        supabase_request("vote_records", method="POST", data={
            "candidate_id": cid,
            "votes": totals[cid],
            "status": "Approved",
            "timestamp": sim_time.isoformat()
        })
    print("[System]: Streaming votes progressively...\n")

    # The Next 15 Seconds:
    for tick in range(1, TOTAL_TICKS + 1):
        # Fake Database Chronology: Each tick we pretend 75 real seconds has passed 
        # So we bypass the `time_diff < 60` database alarm for normal traffic
        sim_time += timedelta(seconds=75)
        
        for cid in candidate_ids:
            is_fraud = False
            desc = "Organic Growth"
            
            # Check fraud spike -> Trigger >50% rule mathematically
            if tick in fraud_ticks and fraud_ticks[tick] == cid:
                is_fraud = True
                jump = int(totals[cid] * 0.70) # 70% unexpected spike (Fraud!)
                totals[cid] += jump
                desc = "70% FRAUDULENT SPIKE INJECTED!"
                print(f" [!!! EVENT] Candidate {cid} detected with {jump} fake votes!")
            else:
                # Organic Growth roughly ~12 to 18% so we end up around ~15000 safely
                increment = random.randint(int(totals[cid] * 0.08), int(totals[cid] * 0.15))
                totals[cid] += increment

            supabase_request("vote_records", method="POST", data={
                "candidate_id": cid,
                "votes": totals[cid],
                "status": "Approved", 
                "timestamp": sim_time.isoformat()
            })
            
            dataset.append((cid, totals[cid], is_fraud, desc))
            sim_time += timedelta(seconds=2)
            
        status_str = ", ".join([f"Cand {cid}: {totals[cid]}" for cid in candidate_ids])
        print(f" [Tick {tick:02d}/15] Streaming Live Votes -> {status_str}")
        
        # Real-time physical delay to run exactly across exactly ~15 seconds inside terminal
        time.sleep(1)

    # Save to CSV log
    dataset_file = "viva_dummy_dataset.csv"
    with open(dataset_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Candidate ID", "Total Votes", "Is Fraud", "Description"])
        for row in dataset:
            writer.writerow(row)

    print(f"\n[✔] Live Demo Completed!")
    for cid in candidate_ids:
        print(f"Cand ID {cid} Final Tally: {totals[cid]}")
    print(f"You can now review the anomalies and exact final logic on the Dashboard.")

if __name__ == '__main__':
    run_simulator()
