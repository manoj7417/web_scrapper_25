# UK Jobs Scraper

This module provides functionality to scrape job listings from the UK Government's Find a Job website (https://findajob.dwp.gov.uk).

## Features

- **Pagination Support**: Scrapes multiple pages of job listings
- **Comprehensive Data Extraction**: Extracts job title, company, location, salary, job type, work type, remote type, and more
- **Database Storage**: Saves data to MongoDB with duplicate prevention
- **API Endpoints**: RESTful API for accessing scraped data
- **Search & Filtering**: Advanced search and filtering capabilities
- **Statistics**: Provides detailed statistics about scraped jobs

## Database Schema

The UK jobs are stored in the `uk_jobs` collection with the following schema:

```javascript
{
    title: String,           // Job title (required)
    company: String,         // Company name
    location: String,        // Job location
    salary: String,          // Salary information
    jobType: String,         // Permanent, Contract, Temporary, Apprenticeship
    workType: String,        // Full time, Part time
    remoteType: String,      // On-site only, Hybrid remote, Fully remote
    postedDate: String,      // Date posted
    jobLink: String,         // Direct link to job posting
    description: String,     // Job description
    category: String,        // Job category
    scrapedAt: Date,        // When the job was scraped
    createdAt: Date,        // Record creation timestamp
    updatedAt: Date         // Record update timestamp
}
```

## Usage

### Command Line

1. **Run the scraper directly:**
   ```bash
   npm run uk-jobs
   ```

2. **Test the scraper:**
   ```bash
   npm run test-uk-jobs
   ```

### Environment Variables

Configure the scraper using these environment variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/your-database

# Scraping Configuration
MAX_PAGES=10          # Maximum pages to scrape (default: 10)
LOCATION_CODE=86383   # Location code for job search (default: 86383)
```

### API Endpoints

#### Get All UK Jobs
```http
GET /api/uk-jobs?page=1&limit=20&search=developer&company=tech&location=london
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search in title, company, or description
- `company`: Filter by company name
- `location`: Filter by location
- `jobType`: Filter by job type
- `workType`: Filter by work type
- `remoteType`: Filter by remote type
- `sortBy`: Sort field (default: postedDate)
- `sortOrder`: Sort order (asc/desc, default: desc)

#### Get UK Job by ID
```http
GET /api/uk-jobs/:id
```

#### Get UK Jobs Statistics
```http
GET /api/uk-jobs-stats
```

Returns:
- Total jobs count
- Today's jobs count
- Top companies
- Job type distribution
- Top locations

#### Manual Scraping
```http
POST /api/scrape-uk-jobs
Content-Type: application/json

{
    "maxPages": 10,
    "location": "86383"
}
```

#### Search UK Jobs
```http
GET /api/search-uk-jobs?q=developer&limit=10
```

## Example API Responses

### Get All UK Jobs
```json
{
    "success": true,
    "data": [
        {
            "_id": "60f1a2b3c4d5e6f7g8h9i0j1",
            "title": "Software Developer",
            "company": "Tech Corp",
            "location": "London",
            "salary": "£45,000 - £55,000 per year",
            "jobType": "Permanent",
            "workType": "Full time",
            "remoteType": "Hybrid remote",
            "postedDate": "23 July 2025",
            "jobLink": "https://findajob.dwp.gov.uk/job/12345",
            "description": "We are looking for a skilled software developer...",
            "category": "IT Jobs",
            "scrapedAt": "2025-01-23T10:30:00.000Z",
            "createdAt": "2025-01-23T10:30:00.000Z",
            "updatedAt": "2025-01-23T10:30:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
    }
}
```

### Scraping Results
```json
{
    "success": true,
    "message": "UK Jobs scraping completed",
    "data": {
        "saved": 45,
        "duplicates": 5,
        "errors": 0,
        "maxPages": 10,
        "location": "86383"
    }
}
```

## Configuration

### Location Codes

The scraper uses location codes to filter jobs by area. Common codes include:

- `86383`: UK (default)
- `London`: London area
- `Manchester`: Manchester area
- `Birmingham`: Birmingham area

### Pagination Settings

- **Default max pages**: 10
- **Delay between pages**: 2 seconds
- **Timeout per page**: 30 seconds

## Error Handling

The scraper includes comprehensive error handling:

- **Network errors**: Retries with exponential backoff
- **Page structure changes**: Graceful degradation
- **Database errors**: Detailed error logging
- **Duplicate prevention**: Automatic duplicate detection

## Monitoring

The scraper provides detailed logging:

- **Info logs**: Page navigation, data extraction progress
- **Success logs**: Successful operations with counts
- **Warning logs**: Non-critical issues (missing data, etc.)
- **Error logs**: Critical failures with stack traces

## Performance

- **Optimized browser settings**: Disabled images, CSS, and unnecessary features
- **Efficient data extraction**: Minimal DOM queries
- **Database optimization**: Indexed fields for fast queries
- **Memory management**: Proper browser cleanup

## Troubleshooting

### Common Issues

1. **No jobs scraped**: Check if the website structure has changed
2. **Browser launch failures**: Ensure Puppeteer is properly installed
3. **Database connection errors**: Verify MongoDB connection string
4. **Timeout errors**: Increase timeout settings for slow connections

### Debug Mode

Enable debug logging by setting the log level:

```javascript
// In your environment
LOG_LEVEL=debug
```

## Legal Considerations

- Respect the website's robots.txt
- Include reasonable delays between requests
- Don't overload the server
- Check the website's terms of service
- Consider implementing rate limiting for production use

## Contributing

When contributing to the UK jobs scraper:

1. Test with a small number of pages first
2. Verify the website structure hasn't changed
3. Update selectors if the HTML structure changes
4. Add appropriate error handling
5. Update documentation for any new features 