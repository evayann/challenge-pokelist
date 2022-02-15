const pokemonListDiv = document.querySelector(".pokemon-list-div");
const pokemonStats = document.querySelector(".pokemon-stats");
const pokemonList = document.querySelector(".pokemon-list");
const searchBar = document.querySelector(".search");

let currentActive = 0;
let selected;
let pkmCry;

const zip = (...arrays) => {
    const length = Math.min(...arrays.map(arr => arr.length));
    return Array.from({ length }, (value, index) => arrays.map((array => array[index])));
};

const fetchJson = url => fetch(url).then(r => r.json()).catch(console.log);

async function createPokemons() {
    [pokemonsSpec, pokemonsDescription] = await Promise.all([
        Promise.all(new Array(151).fill(0).map((_, i) => fetchJson(`https://pokeapi.co/api/v2/pokemon/${i + 1}`))),
        Promise.all(new Array(151).fill(0).map((_, i) => fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${i + 1}`))),
    ]);

    pokemons = [];
    zip(pokemonsSpec, pokemonsDescription).forEach(([p, d], idx) => {
        pokemons.push({
            id: (idx + 1).toString().padStart(3, "0"),
            name: p.name.toUpperCase(),
            img: p.sprites.versions["generation-v"]["black-white"].animated.front_default,
            species: d.genera[7].genus.replace(' Pokémon', '').toUpperCase(),
            height: p.height / 10,
            weight: p.weight / 10,
            description: d.flavor_text_entries[6].flavor_text.replaceAll("\n", "").replaceAll("\f", " "),
            cry: `./cries/${idx + 1}.wav`
        });
    });


    return pokemons;
}

function displayPokemon(pokemon) {
    document.querySelector(".id").textContent = pokemon.id;
    document.querySelector(".current-pkm-name").textContent = pokemon.name;
    document.querySelector(".current-pkm-img").src = pokemon.img;
    document.querySelector(".species").textContent = pokemon.species;
    document.querySelector(".size").textContent = pokemon.height;
    document.querySelector(".weight").textContent = pokemon.weight;
    document.querySelector(".description").textContent = pokemon.description;
    pkmCry = new Audio(pokemon.cry);
}

function selectPokemon(id) {
    li = document.querySelector(`.pokemon-list-div > ul > li:nth-child(${id + 1})`);
    selected?.classList.toggle("pokemon-selected"); // Remove style of previous selected
    li.classList.toggle("pokemon-selected"); // And add it on this element
    displayPokemon(pokemons[id]);
    selected = li;
    currentActive = id;
}

(async() => {
    pokemons = await createPokemons();
    pokemons.forEach(p => {
        const pokemonEntry = document.createElement('li');
        pokemonEntry.innerHTML = `<span>${p.id}</span> <span class="pokemon-name">${p.name}</span>`;
        pokemonEntry.addEventListener("click", () => {
            selected?.classList.toggle("pokemon-selected"); // Remove style of previous selected
            pokemonEntry.classList.toggle("pokemon-selected"); // And add it on this element
            displayPokemon(p);
            selected = pokemonEntry;
            currentActive = p.id - 1;

            if (window.innerWidth < 800) 
                switchPanel();
        });
        pokemonList.appendChild(pokemonEntry);
    });

    selectPokemon(currentActive);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    document.querySelector(".loading-pokeball").classList.toggle("invisible");
    await new Promise(resolve => setTimeout(resolve, 300));
    document.querySelector(".card").classList.toggle("slide-apparition");
    await new Promise(resolve => setTimeout(resolve, 200));
    document.body.removeChild(document.querySelector(".loading-pokeball"));

    checkDisplay();
})();

searchBar.addEventListener("input", () => {
    for (let pokemonLi of pokemonList.children) {
        const pkmInSearch = pokemonLi.innerHTML.includes(searchBar.value.toUpperCase());
        pkmInSearch ? 
            pokemonLi.classList.remove("undisplay") : 
            pokemonLi.classList.add("undisplay");
    }
});

const checkDisplay = () => {
    window.innerWidth < 800 ?
        pokemonListDiv.classList.add("undisplay") :
        pokemonListDiv.classList.remove("undisplay");
};
window.onresize = checkDisplay;

const switchPanel = () => {
    pokemonListDiv.classList.toggle("undisplay");
    pokemonStats.classList.toggle("undisplay");
};
document.querySelector("#toggle-button").addEventListener("click", () => {
    switchPanel();
});

document.querySelector("#cry-pkm").addEventListener("mouseup", () => {
    pkmCry.play();
});

document.addEventListener("keydown", e => {
    if (e.code === "ArrowUp") {
        if (currentActive <= 0) return;
        selectPokemon(currentActive - 1);
    }
    else if (e.code === "ArrowDown") {
        if (currentActive >= pokemons.length - 1) return;
        selectPokemon(currentActive + 1);
    }
});