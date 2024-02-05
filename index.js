const { readFileSync } = require('fs');

class ServicoCalculoFatura {
    constructor(pecas) {
        this.pecas = pecas;
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2
        }).format(valor / 100);
    }

    getPeca(apresentacao) {
        return this.pecas[apresentacao.id];
    }

    calcularCredito(apre) {
        let creditos = 0;
        creditos += Math.max(apre.audiencia - 30, 0);
        if (this.getPeca(apre).tipo === "comedia") 
            creditos += Math.floor(apre.audiencia / 5);
        return creditos;   
    }

    calcularTotalCreditos(apresentacoes) {
        let creditos = 0;
        for (let apre of apresentacoes) {
            creditos += this.calcularCredito(apre);
        }
        return creditos;
    }

    calcularTotalApresentacao(apre) {
        let total = 0;
        const peca = this.getPeca(apre);
        switch (peca.tipo) {
            case "tragedia":
                total = 40000;
                if (apre.audiencia > 30) {
                    total += 1000 * (apre.audiencia - 30);
                }
                break;
            case "comedia":
                total = 30000;
                if (apre.audiencia > 20) {
                    total += 10000 + 500 * (apre.audiencia - 20);
                }
                total += 300 * apre.audiencia;
                break;
            default:
                throw new Error(`Peça desconhecia: ${peca.tipo}`);
        }
        return total;
    }

    calcularTotalFatura(apresentacoes) {
        let totalFatura = 0;
        for (let apre of apresentacoes) {
            totalFatura += this.calcularTotalApresentacao(apre);
        }
        return totalFatura;
    }
}

function gerarFaturaStr(fatura, pecas, calc) {
    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.getPeca(apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
    return faturaStr;
}

/*
//  function gerarFaturaHTML(fatura, pecas, calc) {
    let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;
    for (let apre of fatura.apresentacoes) {
        faturaHTML += `  <li> ${calc.getPeca(apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos) </li>\n`;
    }
    faturaHTML += `</ul>\n<p> Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))} </p>\n`;
    faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} </p>\n</html>`;
    return faturaHTML;
}
*/

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura(pecas);

const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);

/*
//const faturaHTML = gerarFaturaHTML(faturas, pecas, calc);
console.log(faturaHTML);
*/
