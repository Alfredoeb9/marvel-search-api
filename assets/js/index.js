const apikey = '&apikey=91053ae9f8ae1e14298f662586ac9c6d';
const proxy = 'https://cors-anywhere.herokuapp.com/';
const metric = '?name='
const heading = document.querySelector(".header");
const bio = document.querySelector('.description');
const characterImage = document.querySelector('.character-img');
let input = document.querySelector('.prompt');
let comics = document.querySelector('.comics');
let comicsList = document.querySelector('.comics-list');
let metaDetail = document.querySelector('.meta_detail');
let metaWiki = document.querySelector('.meta_wiki');
let metaComic = document.querySelector('.meta_comic');
let output;


let setup = () => {
  let btn = document.querySelector('.btn');
  console.log(btn)
  btn.addEventListener('click', () => {
    getCharacters();
  })
}

setup();


let getCharacters = () => {
  fetch(`https://gateway.marvel.com:443/v1/public/characters${metric}${input.value}${apikey}`)
  .then((res) => {
    return res.json();
  }).then((data) => {
    console.log(data);
    // save all results of search value
    let results = data.data.results[0];

    // Output certain info to the user
    heading.innerHTML = results.name;
    bio.innerHTML = results.description;
    characterImage.src = `${results.thumbnail.path}.${results.thumbnail.extension}`;
    // forEach comic print them out with li tag inside of comic list
    results.comics.items.forEach(comic => {
      output += `
       
          <li>${comic.name}</li>
       
      `
      comicsList.innerHTML = output;

      
    })

    let metaResults = results.urls;
      // Get urls for meta section
      // console.log(metaResults[0].url);
      metaDetail.href = `${metaResults[0].url}`;
      metaWiki.href = `${metaResults[1].url}`;
      metaComic.href = `${metaResults[2].url}`;
  }).catch((err) => {
    console.log('ERROR: ', err)
  })
}