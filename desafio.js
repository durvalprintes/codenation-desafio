import { get, post } from 'axios';
import { resolve } from 'path';
import { writeFileSync, createReadStream } from 'fs';
import sha1 from 'sha1';
import Form from 'form-data';

async function score() {
  try {
    const token = 'd55d68f8cce28a574a29f9c58a25eeee3d849b1f';
    const { data } = await get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${token}`);
    const file = resolve(__dirname, 'answer.json');
    writeFileSync(file, JSON.stringify(data));
    const { numero_casas } = data;
    let cifrado = data.cifrado.toLowerCase().split('');
    let decifrado = cifrado.map(letra => {
      const code = letra.charCodeAt(0);
      return letra.match('[a-z]') ?
        String.fromCharCode((code >= (97 + numero_casas) ? code - numero_casas : code + 22)) :
        letra;
    });
    data.decifrado = decifrado.join('');
    data.resumo_criptografico = sha1(data.decifrado);
    writeFileSync(file, JSON.stringify(data));
    let form = new Form();
    form.append('answer', createReadStream(file, 'utf8'));
    const url = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`;
    const config = { headers: form.getHeaders() };
    const score = await post(url, form, config);
    console.log(score.data);
  }
  catch (error) {
    console.error(error);
  }
}

score();
