import os
import sys
import json
import time
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from gradio_client import Client, handle_file

# Reconfigure stdout/stderr to UTF-8 to handle Hindi character prints on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Fallback for older python versions
        import codecs
        sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
        sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

# Load HF token from .env file if available
HF_TOKEN = None
env_path = ".env"
if os.path.exists(env_path):
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("VITE_HF_API_KEY="):
                    HF_TOKEN = line.split("=", 1)[1].strip()
                    break
    except Exception as e:
        print(f"[Warning] Failed to read .env file for HF token: {e}")



class TTSHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        # Enable CORS so our React app on localhost:5173 can call this server
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        if self.path == "/api/tts":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                text = data.get("text", "")
                
                if not text:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"error": "No text provided"}).encode("utf-8"))
                    return

                print(f"\n[TTS Server] Received request to generate: \"{text}\"")
                
                # Check for transcription.txt in scratch folder
                transcription_path = r"scratch/transcription.txt"
                ref_text = "मनुष्य भविष्य की चिंताओं और अतीत की यादों में खोया रहता है, परन्तु जीवन तो केवल वर्तमान क्षण में ही है।"
                
                if os.path.exists(transcription_path):
                    try:
                        with open(transcription_path, "r", encoding="utf-8") as f:
                            text_content = f.read().strip()
                            if text_content:
                                ref_text = text_content
                    except Exception as fe:
                        print(f"[Warning] Failed to read transcription file: {fe}")
                
                print(f"[TTS Server] Using Reference Text: \"{ref_text}\"")
                
                ref_audio = r"public/krishna_voice_sample.mp3"
                if not os.path.exists(ref_audio):
                    ref_audio = r"gita-app/public/krishna_voice_sample.mp3"

                print(f"[TTS Server] Using Reference Audio: {ref_audio}")

                # Call E2-F5-TTS prediction API with retries to handle transient rate limits
                max_retries = 3
                retry_delay = 4  # seconds
                result = None

                for attempt in range(1, max_retries + 1):
                    try:
                        print(f"[TTS Server] Connecting to space (Attempt {attempt}/{max_retries})...")
                        client = Client("mrfakename/E2-F5-TTS", token=HF_TOKEN)
                        
                        result = client.predict(
                            ref_audio=handle_file(ref_audio),
                            ref_text=ref_text,
                            gen_text=text,
                            remove_silence=True,
                            api_name="/predict"
                        )
                        break  # Success!
                    except Exception as e:
                        err_str = str(e)
                        print(f"[TTS Server] Attempt {attempt} failed: {err_str}")
                        if "ZeroGPU quota" in err_str and attempt < max_retries:
                            print(f"[TTS Server] ZeroGPU quota hit. Waiting {retry_delay}s to retry...")
                            time.sleep(retry_delay)
                        elif attempt < max_retries:
                            print(f"[TTS Server] Error occurred. Retrying in {retry_delay}s...")
                            time.sleep(retry_delay)
                        else:
                            raise e
                
                # result is the path to the temporary wav file generated by Gradio Client
                if os.path.exists(result):
                    self._set_headers(200, "audio/wav")
                    with open(result, "rb") as f:
                        self.wfile.write(f.read())
                    print("[TTS Server] Success! Audio generated and returned to client.")
                else:
                    self._set_headers(500)
                    self.wfile.write(json.dumps({"error": "Gradio client failed to return file path."}).encode("utf-8"))
            
            except Exception as e:
                print(f"[TTS Server] Error: {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
        else:
            self._set_headers(404)

def run_server():
    server_address = ("", 5002)
    httpd = HTTPServer(server_address, TTSHandler)
    print("Python local TTS voice cloning server running on http://localhost:5002...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local TTS server...")

if __name__ == "__main__":
    run_server()
