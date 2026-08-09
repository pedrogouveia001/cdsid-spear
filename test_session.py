import subprocess
import time
import requests
import re

def test_flow():
    print("Starting SPEAR.exe...")
    proc = subprocess.Popen(
        [r".\SPEAR.exe"],
        cwd=r"c:\Users\CDSID\Desktop\Pedro - CDSID\Surrogate Input Delphi"
    )
    
    # Wait for server to start
    time.sleep(2)
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    try:
        # Step 1: Initial request to establish session
        print("1. Requesting home page...")
        r1 = session.get("http://127.0.0.1:8888/", timeout=5)
        print("   Status:", r1.status_code)
        
        # Parse action and session parameters
        action_match = re.search(r'action="(/EXEC/[^"]+)"', r1.text)
        session_match = re.search(r'name="IW_SessionID_"\s+value="([^"]+)"', r1.text)
        track_match = re.search(r'name="IW_TrackID_"\s+value="([^"]+)"', r1.text)
        
        if not action_match or not session_match:
            print("Failed to parse session redirection form. Content:")
            print(r1.text[:500])
            return
            
        action_url = "http://127.0.0.1:8888" + action_match.group(1)
        session_id = session_match.group(1)
        track_id = track_match.group(1) if track_match else "0"
        
        print(f"   Session ID: {session_id}")
        print(f"   Action URL: {action_url}")
        
        # Step 2: Post screen sizes to action URL
        print("2. Submitting screen size postback...")
        payload = {
            "IW_width": "1280",
            "IW_height": "800",
            "IW_SessionID_": session_id,
            "IW_TrackID_": track_id
        }
        r2 = session.post(action_url, data=payload, timeout=5)
        print("   Status:", r2.status_code)
        print("   HTML Length:", len(r2.text))
        
        # Verify welcome page content
        if "btnGoToLogin" in r2.text or "welcome-container" in r2.text:
            print("\nSUCCESS: The Welcome page was served successfully and contains 'welcome-container'!")
            print("First 200 chars of actual content:")
            body_start = r2.text.find("<body")
            if body_start != -1:
                print(r2.text[body_start:body_start+400].strip())
            else:
                print(r2.text[:200].strip())
        else:
            print("\nFAILURE: Served page does not contain expected welcome content. Preview:")
            print(r2.text[:1000])
            
    except Exception as e:
        print("Error during test execution:", e)
    finally:
        print("Terminating SPEAR.exe...")
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except:
            proc.kill()
        print("Done.")

if __name__ == '__main__':
    test_flow()
