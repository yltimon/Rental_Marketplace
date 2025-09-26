// /app/dashboard/owner/[id]/page.tsx
import { connectToDatabase } from "@/lib/db";
import { Item } from "@/models/item";

export default async function OwnerDashboard({ params }: { params: { id: string } }) {
  await connectToDatabase();
  const items = await Item.find({ owner: params.id });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>
      <p>Welcome, Owner {params.id}</p>

      <h2 className="mt-6 text-lg font-semibold">Your Items</h2>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item._id} className="border p-3 rounded-md">
            {item.title} — ${item.pricePerDay}/day
          </li>
        ))}
      </ul>
    </div>
  );
}
