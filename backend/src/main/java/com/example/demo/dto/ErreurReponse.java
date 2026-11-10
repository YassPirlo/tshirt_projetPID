package com.example.demo.dto;

// Corps JSON renvoyé quand un appel échoue : {"message": "..."}
//
// Le nom du champ n'est pas libre : le front lit exactement « message »
// (voir envoyerJson() dans frontend/src/api.ts, qui fait
// « if (typeof donnees?.message === 'string') »). Renommer ce champ ferait
// silencieusement retomber le front sur son message par défaut.
//
// Un seul champ, et surtout pas la stack trace ni le nom de la classe
// d'exception : ça renseignerait un attaquant sur nos dépendances.
public record ErreurReponse(String message) {
}
