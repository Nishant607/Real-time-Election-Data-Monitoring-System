import urllib.request
import urllib.error
import json
from datetime import datetime, timezone

# --- SUPABASE CREDENTIALS ---
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

def main():
    print("====================================")
    print("  MANUAL VOTE ENTRY SYSTEM (LIVE) ")
    print("====================================\n")

    print("[*] Fetching registered candidates...")
    candidates = supabase_request("candidates?select=*")
    
    if not candidates:
        print("[!] No candidates found in database.")
        return

    for c in candidates:
        print(f" -> ID: {c.get('id')} | Name: {c.get('name')} | Party: {c.get('party')}")

    print("\n")
    try:
        cid = int(input("[?] Enter the ID of the candidate you want to add votes for: "))
        votes = int(input("[?] Enter the exact total number of votes they should have now: "))
        
        print(f"\n[*] Submitting {votes} votes for candidate ID {cid} to live database...")
        
        sim_time = datetime.now(timezone.utc).isoformat()
        res = supabase_request("vote_records", method="POST", data={
            "candidate_id": cid,
            "votes": votes,
            "status": "Approved",
            "timestamp": sim_time
        })
        
        if res:
            print("\n[✔] SUCCESS! Votes added successfully. Check your React Dashboard!")
        else:
            print("\n[X] FAILURE! Could not add votes.")

    except ValueError:
        print("[!] Invalid input. Please enter numbers only.")

if __name__ == '__main__':
    main()
