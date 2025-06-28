# Storage Server

A modern file storage server built with Next.js, Supabase, and Vercel. Upload, manage, and share your files with a beautiful and intuitive interface.

## Features

- 🚀 **Fast & Modern**: Built with Next.js 14 and TypeScript
- 📁 **File Management**: Upload, download, and delete files
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS
- 🔒 **Secure**: Supabase authentication and storage
- 📱 **Responsive**: Works on desktop and mobile
- ☁️ **Cloud Ready**: Deploy to Vercel with ease

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database & Storage)
- **Deployment**: Vercel
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd storage-server
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings > API to get your project URL and anon key
3. Create a storage bucket named `files`:
   - Go to Storage in your Supabase dashboard
   - Click "Create a new bucket"
   - Name it `files`
   - Set it to public (or private based on your needs)

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Project Structure

```
storage-server/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── FileUpload.tsx     # File upload component
│   └── FileList.tsx       # File list component
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Features

### File Upload
- Drag and drop interface
- Multiple file selection
- Progress indication
- File type validation

### File Management
- View all uploaded files
- Download files
- Delete files
- File size and date information

### Security
- Supabase authentication ready
- Secure file storage
- Environment variable protection

## Customization

### Styling
The app uses Tailwind CSS for styling. You can customize the design by:
- Modifying `tailwind.config.js`
- Updating component classes
- Adding custom CSS in `globals.css`

### Storage Configuration
To change storage settings:
- Update bucket policies in Supabase dashboard
- Modify file upload logic in `FileUpload.tsx`
- Add file type restrictions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Open an issue in this repository

## Roadmap

- [ ] User authentication
- [ ] File sharing links
- [ ] File preview
- [ ] Folder organization
- [ ] Search functionality
- [ ] File versioning 