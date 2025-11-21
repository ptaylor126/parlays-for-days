# If Server Won't Start

Run these in order:

1. Navigate to web folder:
   cd web

2. Clear caches:
   npm run clean
   (or: rm -rf .next node_modules/.cache)

3. Start server:
   npm run dev

4. If still broken:
   rm -rf node_modules package-lock.json
   npm install
   npm run dev

5. Open browser:
   http://localhost:3000