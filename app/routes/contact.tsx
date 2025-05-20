import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const firstName = formData.get("Prenom");
    const lastName = formData.get("Nom");
    const email = formData.get("email");
    const message = formData.get("message");


    if (!firstName || !lastName || !email || !message) {
        return json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    try {
        console.log(firstName);
        console.log(lastName);
        console.log(email);
        console.log(message);
        const response = await fetch("https://big-creativity-8aeca3e09b.strapiapp.com/api/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer f5adea52bdc2ee42eb1550ceab7ed36f333037a08c8dbf7ea844691dd646d80170abf41c08783d83b97b6044d525109af435e59d21d7fc5ee437f70c6d97036a8167d82809e7b4888b738b4f171b33493dfa34c562172b2e94984f3d5e9d90935f0c51340312bc922533c5c94de0c452d4c8238f27c7f63e33878357a980a8c3"
            },
            body: JSON.stringify({
                data: {
                    "Prenom": firstName,
                    "Nom" : lastName,
                    "Email" : email,
                    "Message" : message
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Erreur lors de l'envoi.");
        }

        return redirect("/contact?success=1");
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
};


export default function Contact() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Contactez-nous</h1>
            {actionData?.error && <p className="text-red-600">{actionData.error}</p>}
            <Form method="post" className="space-y-4">
                <input name="Prenom" placeholder="Prénom" className="w-full p-2 border rounded" />
                <input name="Nom" placeholder="Nom" className="w-full p-2 border rounded" />
                <input name="email" type="email" placeholder="Votre email" className="w-full p-2 border rounded" />
                <textarea name="message" placeholder="Votre message" className="w-full p-2 border rounded" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
            </Form>
        </div>
    );
}
