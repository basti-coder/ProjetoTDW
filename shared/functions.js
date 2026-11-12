// shared/functions.js
// Funções reutilizáveis para ler/gravar os postos em ficheiro JSON (Parte B).
// Nota: a partir da Parte D (MongoDB) estas funções deixam de ser usadas
// pelos endpoints, mas mantêm-se aqui (não se apaga nada).

const fs = require("fs");

module.exports = { gravarPostos, lerPostos };
function lerPostos(caminho) {
  return new Promise(function (resolve, reject) {
    fs.readFile(caminho, "utf8", function (err, data) {
      if (err) return reject(err);
      if (data === "" || data == null) return resolve([]); // ficheiro vazio -> array vazio
      try {
        resolve(JSON.parse(data)); // texto JSON -> array de objetos
      } catch (error) {
        reject(error); // JSON mal formado
      }
    });
  });
}

// Grava o array de postos no ficheiro, em formato JSON.
function gravarPostos(caminho, postos) {
  fs.writeFile(caminho, JSON.stringify(postos, null, 2), (err) => {
    if (err != null) return console.log(err);
    console.log("Postos gravados com sucesso.");
  });
}
