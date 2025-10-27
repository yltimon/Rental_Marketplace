
export function transformBackendItem(backendItem: any) {
  return {
    id: backendItem._id?.toString() || backendItem.id,
    title: backendItem.title || 'Untitled Item',
    description: backendItem.description || 'No description available',
    price: backendItem.pricePerDay || 0, // Map pricePerDay to price
    category: backendItem.category || 'others',
    location: backendItem.location || 'Location not specified',
    rating: backendItem.averageRating || 0, // Map averageRating to rating
    reviewCount: backendItem.reviewCount || 0,
    image: backendItem.imageUrl || '/placeholder-image.jpg',
    available: backendItem.available ?? true, // Map available to isAvailable
    owner: {
      name: backendItem.owner?.name || 'Unknown Owner',
      email: backendItem.owner?.email || '' // Keep email if needed
    }
  };
}