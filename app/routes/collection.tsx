import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

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
    try {
      const res = await fetch(`${STRAPI_BASE_URL}/api/products?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      });
    
      if (!res.ok) {
        throw new Response("Erreur lors du chargement des produits", { status: res.status });
      }
      
      const data = await res.json();
      
      // Vérification que data.data existe et est un tableau
      if (!data.data || !Array.isArray(data.data)) {
        throw new Response("Format de données inattendu", { status: 500 });
      }
      
      const products: Product[] = data.data.map((item: any) => {
        return {
          id: item.id,
          documentId: item.attributes?.documentId || item.documentId,
          title: item.attributes?.titre || item.titre || "Sans titre",
          description: item.attributes?.description || item.description,
          price: item.attributes?.price || item.price,
          imageUrl: item.attributes?.image?.data?.attributes?.url 
            ? `${STRAPI_BASE_URL}${item.attributes.image.data.attributes.url}`
            : item.image?.[0]?.url
              ? item.image[0].url
              : "https://via.placeholder.com/300x200?text=Pas+d'image",
        };
      });
    
      return json(products);
    } catch (error) {
      console.error("Erreur:", error);
      throw new Response("Erreur lors du chargement des produits", { status: 500 });
    }
  };
  
export default function CollectionPage() {
  const products = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Produits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link 
            to={`/products/${product.documentId}`} 
            key={product.id} 
            className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{product.title}</h2>
              {product.description && (
                <p className="mt-2 text-gray-600 line-clamp-2">{product.description}</p>
              )}
              {product.price && (
                <p className="mt-2 font-bold text-blue-600">{product.price} €</p>
              )}
              <div className="mt-3 text-sm text-blue-500 font-medium">
                Voir les détails →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
