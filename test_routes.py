import subprocess
import time
import requests

def test_pages():
    print("Starting SPEAR.exe...")
    proc = subprocess.Popen(
        [r".\SPEAR.exe"],
        cwd=r"c:\Users\CDSID\Desktop\Pedro - CDSID\Surrogate Input Delphi"
    )
    
    # Wait for server to start
    time.sleep(2)
    
    routes = [
        "/",
        "/login",
        "/register"
    ]
    
    for route in routes:
        url = f"http://127.0.0.1:8888{route}"
        print(f"Requesting {url}...")
        try:
            res = requests.get(url, timeout=5)
            print(f"  Status Code: {res.status_code}")
            print(f"  Content length: {len(res.text)} characters")
            if res.status_code == 200:
                print(f"  Preview (first 100 chars): {res.text[:100].strip()}")
            else:
                print(f"  Error Preview: {res.text[:200]}")
        except Exception as e:
            print(f"  Request failed: {e}")
            
    print("Terminating SPEAR.exe...")
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except:
        proc.kill()
    print("Done.")

if __name__ == '__main__':
    test_pages()
