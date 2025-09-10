export class AbrigoAnimais {
  // Dados constantes dos animais e seus brinquedos favoritos.
  // As chaves estão em maiúsculas para facilitar a busca e normalização dos dados.
  animais = {
    REX: ['RATO', 'BOLA'],
    MIMI: ['BOLA', 'LASER'],
    FOFO: ['BOLA', 'RATO', 'LASER'],
    ZERO: ['RATO', 'BOLA'],
    BOLA: ['CAIXA', 'NOVELO'],
    BEBE: ['LASER', 'RATO', 'BOLA'],
    LOCO: ['SKATE', 'RATO'],
  };

  // Conjunto de todos os brinquedos válidos para uma validação rápida.
  todosOsBrinquedos = new Set([
    'RATO', 'BOLA', 'LASER', 'CAIXA', 'NOVELO', 'SKATE'
  ]);

  /**
   * Método principal que processa a lógica de adoção.
   * @param {string} brinquedosPessoa1Str String com brinquedos da pessoa 1, separados por vírgula.
   * @param {string} brinquedosPessoa2Str String com brinquedos da pessoa 2, separados por vírgula.
   * @param {string} animaisConsideradosStr String com os nomes dos animais a serem considerados.
   * @returns {{lista: string[]}|{erro: string}} Retorna a lista de resultados ou um objeto de erro.
   */
  encontraPessoas(brinquedosPessoa1Str, brinquedosPessoa2Str, animaisConsideradosStr) {
    try {
      // 1. Validação e tratamento das entradas
      const brinquedosPessoa1 = this._parseEValidarBrinquedos(brinquedosPessoa1Str);
      const brinquedosPessoa2 = this._parseEValidarBrinquedos(brinquedosPessoa2Str);
      const animaisConsiderados = this._parseEValidarAnimais(animaisConsideradosStr);

      // 2. Lógica de Adoção
      const adocoesPessoa1 = [];
      const adocoesPessoa2 = [];
      const resultados = [];

      // Separa o "Loco" para ser processado por último, pois sua regra depende de outras adoções.
      const animaisNormais = animaisConsiderados.filter(a => a.upper !== 'LOCO');
      const loco = animaisConsiderados.find(a => a.upper === 'LOCO');

      // Processa os animais com regras padrão
      for (const animal of animaisNormais) {
        const aptidaoP1 = this._verificaAptidao(brinquedosPessoa1, animal.upper, adocoesPessoa1);
        const aptidaoP2 = this._verificaAptidao(brinquedosPessoa2, animal.upper, adocoesPessoa2);

        if (aptidaoP1 && !aptidaoP2) {
          adocoesPessoa1.push(animal.upper);
          resultados.push({ nome: animal.original, dono: 'pessoa 1' });
        } else if (!aptidaoP1 && aptidaoP2) {
          adocoesPessoa2.push(animal.upper);
          resultados.push({ nome: animal.original, dono: 'pessoa 2' });
        } else { // Se ambos são aptos (empate) ou nenhum é, o animal fica no abrigo
          resultados.push({ nome: animal.original, dono: 'abrigo' });
        }
      }

      // Processa o "Loco" se ele estiver na lista
      if (loco) {
        const aptidaoP1 = this._verificaAptidao(brinquedosPessoa1, loco.upper, adocoesPessoa1);
        const aptidaoP2 = this._verificaAptidao(brinquedosPessoa2, loco.upper, adocoesPessoa2);

        if (aptidaoP1 && !aptidaoP2) {
          resultados.push({ nome: loco.original, dono: 'pessoa 1' });
        } else if (!aptidaoP1 && aptidaoP2) {
          resultados.push({ nome: loco.original, dono: 'pessoa 2' });
        } else {
          resultados.push({ nome: loco.original, dono: 'abrigo' });
        }
      }

      // 3. Formatação da saída
      // Ordena a lista de resultados em ordem alfabética pelo nome do animal.
      resultados.sort((a, b) => a.nome.localeCompare(b.nome));
      const listaFinal = resultados.map(r => `${r.nome} - ${r.dono}`);

      return { lista: listaFinal };

    } catch (error) {
      return { erro: error.message };
    }
  }

  /**
   * Verifica se uma pessoa está apta a adotar um animal.
   * @param {string[]} brinquedosPessoa Lista de brinquedos que a pessoa possui.
   * @param {string} nomeAnimalUpper Nome do animal em maiúsculas.
   * @param {string[]} adocoesAtuais Animais já adotados pela pessoa.
   * @returns {boolean} Verdadeiro se a pessoa estiver apta.
   */
  _verificaAptidao(brinquedosPessoa, nomeAnimalUpper, adocoesAtuais) {
    // Regra: Uma pessoa não pode levar mais de três animais para casa
    if (adocoesAtuais.length >= 3) {
      return false;
    }

    const brinquedosNecessarios = this.animais[nomeAnimalUpper];
    
    // Regra especial para o Loco
    if (nomeAnimalUpper === 'LOCO') {
      // Precisa de companhia (já ter adotado outro animal)
      if (adocoesAtuais.length === 0) {
        return false;
      }
      // A ordem dos brinquedos não importa, apenas a posse
      const setBrinquedosPessoa = new Set(brinquedosPessoa);
      return brinquedosNecessarios.every(brinquedo => setBrinquedosPessoa.has(brinquedo));
    }

    // Regra para animais normais: a ordem dos brinquedos importa
    let indiceBrinquedoNecessario = 0;
    for (const brinquedoDaPessoa of brinquedosPessoa) {
      if (brinquedoDaPessoa === brinquedosNecessarios[indiceBrinquedoNecessario]) {
        indiceBrinquedoNecessario++;
      }
      if (indiceBrinquedoNecessario === brinquedosNecessarios.length) {
        return true; // Encontrou todos na ordem correta
      }
    }

    return false; // Não encontrou a sequência correta de brinquedos
  }

  /**
   * Converte a string de brinquedos em um array, validando o conteúdo.
   * @param {string} brinquedosStr String de entrada.
   * @returns {string[]} Array de brinquedos normalizados.
   */
  _parseEValidarBrinquedos(brinquedosStr) {
    if (!brinquedosStr) return [];
    const brinquedos = brinquedosStr.split(',').map(b => b.trim().toUpperCase());
    
    // Verifica se há brinquedos inválidos ou duplicados
    const setBrinquedos = new Set(brinquedos);
    if (setBrinquedos.size !== brinquedos.length) {
        throw new Error('Brinquedo inválido');
    }
    for (const b of brinquedos) {
        if (!this.todosOsBrinquedos.has(b)) {
            throw new Error('Brinquedo inválido');
        }
    }
    return brinquedos;
  }
  
  /**
   * Converte a string de animais em um array de objetos, validando o conteúdo.
   * @param {string} animaisStr String de entrada.
   * @returns {{original: string, upper: string}[]} Array de animais validados.
   */
  _parseEValidarAnimais(animaisStr) {
    if (!animaisStr) return [];
    const animaisOriginais = animaisStr.split(',').map(a => a.trim());
    const animaisUpper = animaisOriginais.map(a => a.toUpperCase());

    // Verifica se há animais inválidos ou duplicados
    const setAnimais = new Set(animaisUpper);
    if (setAnimais.size !== animaisUpper.length) {
        throw new Error('Animal inválido');
    }
    for (const a of animaisUpper) {
        if (!this.animais[a]) {
            throw new Error('Animal inválido');
        }
    }
    
    // Retorna um objeto com o nome original (para a saída) e em maiúsculo (para a lógica)
    return animaisOriginais.map((original, index) => ({
      original: original,
      upper: animaisUpper[index]
    }));
  }
}

// O export deve ser mantido para compatibilidade com os testes.
export { AbrigoAnimais as AbrigoAnimais };
