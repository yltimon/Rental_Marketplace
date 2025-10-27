import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyListingSidebar({ myItems, itemId, router, userId }: {
    myItems: any[];
    itemId: string | null;
    router: any;
    userId: string | null;
}) {
    return (
        <>
            {/* My Listings Sidebar */}
            <div className="lg:col-span-1">
            <div className="sticky top-4">
                <h2 className="text-xl font-semibold mb-4">My Listings</h2>
                
                {/* Debug info - remove in production */}
                <div className="mb-4 p-2 bg-yellow-100 text-xs rounded">
                Debug: {myItems.length} items, User: {userId}
                </div>

                {myItems.length === 0 ? (
                <Card>
                    <CardContent className="p-4">
                    <div className="text-center text-gray-500 py-8">
                        No listings found
                        <Button 
                        className="w-full mt-4" 
                        onClick={() => router.push("/dashboard/add-listing")}
                        >
                        Create Your First Listing
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                ) : (
                <Card>
                    <CardContent className="p-4">
                    <ul className="space-y-3 max-h-[600px] overflow-y-auto">
                        {myItems.map((item) => (
                        <li key={item._id}>
                            <div 
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                itemId === item._id 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => router.push(`/dashboard/my-listings?id=${item._id}`)}
                            >
                            <div className="flex items-center gap-3">
                                <img 
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="h-12 w-12 object-cover rounded" 
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.jpg';
                                }}
                                />
                                <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.title}</div>
                                <div className="text-xs text-gray-500 capitalize">
                                    {item.category}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-sm font-semibold">
                                    ${item.pricePerDay}/day
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.available 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                </div>
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                    <Button 
                        className="w-full mt-4" 
                        onClick={() => router.push("/dashboard/add-listing")}
                    >
                        + Add New Listing
                    </Button>
                    </CardContent>
                </Card>
                )}
            </div>
            </div>
        </>
    )
}