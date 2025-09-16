# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Client Sphere CRM application.

## 🚀 Quick Setup

### Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project:**
   - Click "Select a project" at the top
   - Click "New Project"
   - Enter your project name (e.g., "Client Sphere")
   - Click "Create"

3. **Enable the Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click on it and press "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. **Go to "APIs & Services" > "Credentials"**
2. **Click "Create Credentials" > "OAuth client ID"**
3. **Configure the consent screen:**
   - Choose "External" for user type
   - Fill in the required information:
     - App name: "Client Sphere"
     - User support email: Your email
     - Developer contact information: Your email
   - Save and continue through the scopes (no changes needed)
   - Add test users if needed for development

4. **Create OAuth client ID:**
   - Application type: "Web application"
   - Name: "Client Sphere Web Client"
   - **Authorized redirect URIs:**
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"

5. **Copy your credentials:**
   - Client ID: Looks like `123456-abcdef.apps.googleusercontent.com`
   - Client Secret: A random string

### Step 3: Configure Environment Variables

1. **Add to your `.env.local` file:**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

2. **For production deployment, add these to your hosting platform:**
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site settings > Build & deploy > Environment variables
   - Railway: Variables tab in your project

### Step 4: Test the Integration

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the sign-in page:**
   - Go to `http://localhost:3000/auth/signin`
   - You should now see a "Continue with Google" button

3. **Test the flow:**
   - Click the Google sign-in button
   - Sign in with your Google account
   - You should be redirected to the dashboard
   - Check the Users page to see your account was created

## 🔧 How It Works

### User Creation Process

When a user signs in with Google for the first time:

1. **Authentication:** Google verifies the user's identity
2. **User Creation:** The app automatically creates a new user record with:
   - Email from Google account
   - Name from Google profile
   - Profile image from Google
   - Default role: `REP` (Sales Representative)
   - Active status: `true`
   - Email verified: `true` (Google pre-verifies)

### Role Assignment

- **New Google users:** Automatically assigned `REP` role
- **Existing users:** Keep their current role if they already exist in the database
- **Inactive users:** Cannot sign in (blocked by the system)

### Security Features

- **Domain Validation:** Only configured redirect URIs are allowed
- **State Verification:** CSRF protection built into NextAuth.js
- **Token Security:** Short-lived access tokens with refresh capability
- **Session Management:** Secure JWT sessions with role information

## 🛠️ Production Setup

### Domain Configuration

For production deployment:

1. **Update redirect URIs in Google Cloud Console:**
   - Add your production domain: `https://yourdomain.com/api/auth/callback/google`
   - Keep localhost for development

2. **Update environment variables:**
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### Domain Verification (Optional)

For enhanced security and to remove the "unverified app" warning:

1. **Verify your domain in Google Cloud Console:**
   - Go to "APIs & Services" > "Domain verification"
   - Add your production domain
   - Follow the verification steps

2. **Submit for verification:**
   - Go to "OAuth consent screen"
   - Submit your app for verification if you expect external users

## 🐛 Troubleshooting

### Common Issues

**1. "Error 400: redirect_uri_mismatch"**
- Check that your redirect URI exactly matches what's configured in Google Cloud Console
- Make sure you're using the correct protocol (http vs https)
- Verify there are no trailing slashes

**2. "Access blocked" error**
- Your app needs to be verified for external users
- Add users as test users in the OAuth consent screen
- Or complete the app verification process

**3. "Invalid client" error**
- Double-check your Client ID and Client Secret
- Make sure they're properly set in your environment variables
- Restart your development server after changing environment variables

**4. Users not being created**
- Check your database connection
- Verify Prisma schema includes all required User fields
- Check server logs for detailed error messages

### Debug Tips

1. **Check NextAuth.js debug logs:**
   ```env
   NEXTAUTH_DEBUG=true
   ```

2. **Verify environment variables are loaded:**
   ```javascript
   console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...')
   ```

3. **Test the auth API directly:**
   - Visit: `http://localhost:3000/api/auth/providers`
   - Should show Google as an available provider

## 📚 Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Configuration Guide](https://next-auth.js.org/configuration/initialization)

## 🔐 Security Best Practices

1. **Keep secrets secure:**
   - Never commit `.env` files to version control
   - Use different client secrets for development and production
   - Rotate secrets regularly

2. **Limit scope:**
   - Only request necessary Google scopes (email, profile)
   - Review permissions regularly

3. **Monitor usage:**
   - Check Google Cloud Console for API usage
   - Set up billing alerts if needed
   - Monitor for suspicious authentication attempts

4. **Regular updates:**
   - Keep NextAuth.js updated
   - Review Google security recommendations
   - Update OAuth consent screen information as needed

---

With Google OAuth configured, users can now sign in seamlessly with their Google accounts while maintaining the security and role-based access control of your CRM system! 🎉