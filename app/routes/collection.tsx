import { LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Key, ReactElement, JSXElementConstructor, ReactNode } from "react";

// Type pour nos items
type Item = {
  id: number;
  title: string;
  imageUrl: string;
};

// L’URL de ton backend Strapi (tu peux mettre ça plus tard dans un .env)
const STRAPI_BASE_URL = "http://localhost:1337";

// 🧠 Le loader essaie Strapi, sinon retourne des fausses données
export const loader: LoaderFunction = async () => {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/items?populate=image`);
    if (!res.ok) throw new Error("Backend Strapi hors ligne");
    const data = await res.json();

    const items: Item[] = data.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      imageUrl:
        STRAPI_BASE_URL + item.attributes.image?.data?.attributes?.url,
    }));

    return json(items);
  } catch (err) {
    console.warn("❌ Impossible de contacter Strapi, on utilise des fake data");

    const fakeItems: Item[] = [
      { id: 1, title: "Carte 1 (fake)", imageUrl: "https://via.placeholder.com/300x200?text=Card+1" },
      { id: 2, title: "Carte 2 (fake)", imageUrl: "https://via.placeholder.com/300x200?text=Card+2" },
      { id: 3, title: "Carte 3 (fake)", imageUrl: "https://via.placeholder.com/300x200?text=Card+3" },
    ];

    return json(fakeItems);
  }
};

// 🖼️ Le composant React qui affiche la grille
export default function CollectionPage() {
    const items = useLoaderData<typeof loader>();

    return (
        <div className="p-8">
            <Link to="/" className="text-blue-600 underline">
              Home
            </Link>
            <h1 className="text-2xl font-bold mb-6">
                Ma Collection
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map((item: {
                    id: Key | null | undefined;
                    imageUrl: string | undefined;
                    title: string;
                }) => (
                    <div
                        key={item.id}
                        className="rounded-xl shadow-md overflow-hidden border border-gray-200"
                    >
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{item.title}</h2>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
