import http.server, functools, os
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path=self.translate_path(self.path)
        if not os.path.isfile(path): return super().send_head()
        rng=self.headers.get('Range')
        if not rng:
            self.send_response(200); 
        size=os.path.getsize(path); ctype=self.guess_type(path)
        if rng and rng.startswith('bytes='):
            s,_,e=rng[6:].partition('-')
            start=int(s) if s else 0; end=int(e) if e else size-1
            end=min(end,size-1); length=end-start+1
            self.send_response(206)
            self.send_header('Content-Type',ctype)
            self.send_header('Accept-Ranges','bytes')
            self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length',str(length))
            self.send_header('Cache-Control','no-store, must-revalidate')
            self.end_headers()
            f=open(path,'rb'); f.seek(start); self._rlen=length; return f
        self.send_header('Content-Type',ctype)
        self.send_header('Accept-Ranges','bytes')
        self.send_header('Content-Length',str(size))
        self.send_header('Cache-Control','no-store, must-revalidate')
        self.end_headers()
        return open(path,'rb')
    def copyfile(self,src,dst):
        if hasattr(self,'_rlen'):
            remaining=self._rlen
            while remaining>0:
                chunk=src.read(min(65536,remaining))
                if not chunk: break
                dst.write(chunk); remaining-=len(chunk)
            del self._rlen
        else: super().copyfile(src,dst)

if __name__ == '__main__':
    import sys, webbrowser, threading
    # port: first CLI arg, else 8732; if busy, step up until a free one is found
    want = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 8732
    handler = functools.partial(H, directory=os.getcwd())
    srv = None
    for port in range(want, want + 50):
        try:
            srv = http.server.HTTPServer(('127.0.0.1', port), handler); break
        except OSError:
            continue
    if srv is None:
        sys.exit(f"Could not find a free port near {want}.")
    url = f"http://localhost:{port}/"
    print(f"\n  Grothendieck House preview running at  {url}\n  (press Ctrl+C to stop)\n")
    if sys.stdout.isatty():  # only auto-open the browser in interactive use
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
