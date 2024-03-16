import { IncomingMessage, ServerResponse } from "http";
import { Pokemon, database } from "./model";
import { renderTemplate } from "./view";

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(await renderTemplate("src/views/HomeView.hbs"));
};

export const getAllPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const url = new URL(req.url!, `http://${req.headers.host}`); // Use URL parsing
    const queryParams = url.searchParams;
    const typeFilter = queryParams.get("type");
    const sortBy = queryParams.get("sortBy");
    let pokemon: Pokemon[] = [];

    // Apply basic filtering if we have a `typeFilter`:
    if (typeFilter) {
        pokemon = database.filter((pokemon) => pokemon.type === typeFilter);
    } else {
     
        pokemon = database;
    }

    if (sortBy === "name") {
        pokemon = [...pokemon].sort((a, b) => a.name.localeCompare(b.name));
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(
        await renderTemplate("src/views/ListView.hbs", {
          heading: "All Pokemon!",
          image: "images/logo.jpeg",
          pokemon: pokemon,
        })
    );
};


export const createPokemon = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    const body = await parseBody(req);
    const newPokemon = Object.fromEntries(new URLSearchParams(body).entries());
    database.push({
        id: database.length + 1,
        name: newPokemon.name,
        type: newPokemon.type
    });

    res.statusCode = 303;
    res.setHeader("Location", "/pokemon");
    res.end()
};

export const getNewForm = async (
    req: IncomingMessage,
    res: ServerResponse,
) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(await renderTemplate("src/views/NewFormView.hbs"));
};

const parseBody = async (req: IncomingMessage) => {
    return new Promise<string>((resolve) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            resolve(body);
        });
    });
};
