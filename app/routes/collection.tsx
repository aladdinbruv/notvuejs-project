import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// 🔐 Ta clé d'API Strapi (ne laisse pas ça en public si possible)
const STRAPI_API_TOKEN = "f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3";

const STRAPI_BASE_URL = "https://big-creativity-8aeca3e09b.strapiapp.com";

type Product = {
  id: number;
  title: string;
  description?: string;
  price?: number;
  imageUrl: string;
};

export const loader: LoaderFunction = async () => {
    const res = await fetch(`${STRAPI_BASE_URL}/api/products?populate=*`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
    });
  
    const data = await res.json();
    console.log("Data:", data.data[0].image[0].url);
  
    if (!res.ok) {
      console.error("Erreur API:", data);
      throw new Response("Erreur lors du chargement des produits", { status: 500 });
    }
  
    const products: Product[] = data.data.map((item: any) => ({
      id: item.id,
      title: item.titre ?? "Sans titre", // 👈 Plus besoin de item.attributes.titre
      imageUrl: item.image?.[0]?.url
        ?  item.image[0].url
        : "https://via.placeholder.com/300x200?text=Pas+d'image",
    }));
  
    return json(products);
  };
  
export default function CollectionPage() {
  const products = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Produits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-md overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{product.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
