# Shop Contact Manager

A professional, mobile-friendly web application to store, organize, and manage shop contact numbers based on locations.

## Features
- **Dashboard**: View total shops, locations, and shops added today.
- **Add Shop**: Add shops with validation, location search, and duplicate prevention.
- **Shop Records**: View shops in a table, filter by location, search, export to Excel/CSV, click-to-call, and WhatsApp integration.
- **Settings**: Manage locations (Add, Edit, Delete, Default).

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React
- **Database**: Supabase
- **Routing**: React Router DOM
- **Other tools**: react-hot-toast (notifications), xlsx (Excel export)

## Setup Instructions

1. **Clone the repository or download the source code.**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Supabase Database Setup:**
   - Create a new project in [Supabase](https://supabase.com/).
   - Go to the SQL Editor in your Supabase dashboard.
   - Copy the contents of `supabase_schema.sql` and run it to create tables and RLS policies.

4. **Environment Variables:**
   - Rename `.env.example` to `.env.local`
   - Add your Supabase URL and Anon Key from the Supabase Project Settings -> API:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Run the application locally:**
   ```bash
   npm run dev
   ```

## Deployment to Vercel
1. Create a GitHub repository and push this code.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Add the Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
5. Click **Deploy**. Vercel will automatically detect the Vite build settings and deploy your application.
