### Reminder on how to add a New Property
### Emailjs service id - service_recce0l
1. Open `data/properties.json` in any text editor
2. Add a new property object to the array following this format:

```json
{
  "id": 4,
  "title": "Your Estate Name",
  "location": "City, State",
  "price": "₦10,000,000",
  "documentation": "Certificate Of Occupancy",
  "tags": ["Electricity 24/7", "Clean Water", "Security", "Paved Road"],
  "description": "Detailed description of your estate and its features.",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "category": "lagos",
  "priceValue": 10000000,
  "featured": false
}
```

### Field Explanations

- **id**: Unique number for each property
- **title**: Name of the estate
- **location**: Full location (City, State)
- **price**: Display price with ₦ symbol
- **documentation**: Type of legal documentation (Government Excision, Certificate Of Occupancy, Gazette)
- **tags**: Array of features/amenities
- **description**: Detailed description for the modal popup
- **images**: Array of image URLs (first image is the main display image)
- **category**: Location category for filtering (lagos, ibadan, abuja)
- **priceValue**: Numeric price value for filtering (without ₦ symbol)
- **featured**: true/false - adds a "FEATURED" badge if true

### Categories for Filtering

Use these category values:
- `"lagos"` - for Lagos properties
- `"ibadan"` - for Ibadan properties  
- `"abuja"` - for Abuja properties

### Documentation Types for Filtering

Use these documentation values:
- `"Government Excision"` - filters under "Government Excision"
- `"Certificate Of Occupancy"` - filters under "Certificate of Occupancy"
