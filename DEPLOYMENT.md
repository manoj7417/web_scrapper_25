# Deployment Guide for eProcurement Scraper

This guide covers deploying the eProcurement scraper to Render.com with proper Chrome installation and configuration.

## Prerequisites

- Render.com account
- MongoDB database (MongoDB Atlas recommended)
- Git repository with the scraper code

## Environment Variables

Set these environment variables in your Render service:

- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `PUPPETEER_EXECUTABLE_PATH`: `/usr/bin/google-chrome-stable`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: `false`

## Render Configuration

The `render.yaml` file is configured to:

1. **Install Chrome during build**: Uses both Puppeteer's bundled Chrome and system Chrome installation
2. **Health checks**: Includes a `/health` endpoint for monitoring
3. **Proper environment**: Sets production environment and Chrome paths

### Build Process

The build command installs Chrome in multiple ways:
- `npx puppeteer browsers install chrome` - Installs Puppeteer's bundled Chrome
- System Chrome installation via apt-get
- Fallback to Puppeteer's bundled Chrome if system installation fails

### Chrome Installation Strategy

The scraper uses a multi-layered approach to find Chrome:

1. **Environment variable**: `PUPPETEER_EXECUTABLE_PATH`
2. **System Chrome**: `/usr/bin/google-chrome-stable`
3. **Alternative paths**: Various common Chrome locations
4. **Puppeteer bundled**: Falls back to Puppeteer's bundled Chrome

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "eProcurement Scraper"
}
```

## Troubleshooting

### Chrome Not Found

If you see "Could not find Chrome" errors:

1. **Check build logs**: Ensure Chrome installation completed successfully
2. **Verify paths**: Check if Chrome exists at expected locations
3. **Test locally**: Run `npm run test-chrome` to verify Chrome installation

### Common Issues

1. **Chrome installation fails**: The build process tries multiple installation methods
2. **Permission errors**: Chrome runs with `--no-sandbox` for containerized environments
3. **Memory issues**: Chrome is configured with minimal resource usage

### Debugging

Use these commands to debug Chrome issues:

```bash
# Test Chrome installation
npm run test-chrome

# Check build configuration
npm run build-check

# Test database connection
npm run test
```

## Monitoring

- **Health checks**: Monitor `/health` endpoint
- **Logs**: Check application logs for scraping status
- **Database**: Monitor MongoDB for new tender data

## Performance

The scraper is optimized for:
- **Resource usage**: Minimal Chrome configuration
- **Error handling**: Robust retry mechanisms
- **Duplicate prevention**: MongoDB-based deduplication
- **Pagination**: Multi-page scraping support

## Security

- **No sandbox**: Chrome runs without sandbox for containerized environments
- **Minimal permissions**: Only necessary Chrome features enabled
- **Environment isolation**: Production environment variables

## Updates

To update the deployment:

1. Push changes to your Git repository
2. Render will automatically redeploy
3. Monitor build logs for Chrome installation
4. Check health endpoint for successful deployment

## Support

For deployment issues:
1. Check Render build logs
2. Verify environment variables
3. Test Chrome installation locally
4. Review application logs for errors 