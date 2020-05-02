import { Injectable } from '@angular/core';

import { Corretora, LivroOrdens, Ordem, Ordens } from '../corretora';

interface OrdemBraziliex {
  price: number;
  amount: number;
}

type OrdensBraziliex = Array<OrdemBraziliex>;

interface LivroOrdensBraziliex {
  asks: OrdensBraziliex;
  bids: OrdensBraziliex;
}

@Injectable({
  providedIn: 'root'
})
export class BraziliexService extends Corretora {
  readonly TAXA_ORDEM_EXECUTORA = 0.005;
  readonly TAXA_SAQUE_FIXA = 9;
  readonly TAXA_SAQUE_FIXA_BANCO_CONVENIADO = this.TAXA_SAQUE_FIXA;
  readonly TAXA_SAQUE_VARIAVEL = 0.0075;
  readonly TAXA_SAQUE_VARIAVEL_BANCO_CONVENIADO = this.TAXA_SAQUE_VARIAVEL;
  readonly POSSUI_CONVENIOS_BANCOS = false;
  readonly LIVRO_ORDENS_VAZIO = {
    asks: [],
    bids: [],
  };

  id = 'braziliex';
  nome = 'Braziliex';
  paginaInicial = 'https://braziliex.com/';
  paginaOrdens = 'https://braziliex.com/trade.php';
  paginaContato = 'https://braziliex.com/exchange/support.php';
  observacao = (
    'A corretora oferece descontos para usuários que possuem certas quantidades'
    + ' do token Braziliex Token (BRZX).'
  );
  webservice = 'https://cors-anywhere.herokuapp.com/https://braziliex.com/api/v1/public/orderbook/btc_brl';
  livroOrdens: LivroOrdens;
  taxaTransferencia = 0.00054714;

  constructor() {
    super();
    this.livroOrdens = null;
  }

  converterLivroOrdensAPI(
    livroOrdensAPI: any,
    dataRequisicao: Date,
  ): LivroOrdens {
    const livroOrdensBraziliex: LivroOrdensBraziliex = (
      livroOrdensAPI
    ) as LivroOrdensBraziliex;
    const ordensVenda: Ordens = [];
    const ordensCompra: Ordens = [];
    const livroOrdens: LivroOrdens = {
      venda: ordensVenda,
      compra: ordensCompra,
      dataRequisicao,
      dataResposta: new Date(),
    };

    livroOrdensBraziliex.asks.forEach((ordemBraziliex: OrdemBraziliex) => {
      const ordem: Ordem = {
        preco: ordemBraziliex.price,
        quantidade: ordemBraziliex.amount,
      };
      ordensVenda.push(ordem);
    });
    livroOrdensBraziliex.bids.forEach((ordemBraziliex: OrdemBraziliex) => {
      const ordem: Ordem = {
        preco: ordemBraziliex.price,
        quantidade: ordemBraziliex.amount,
      };
      ordensCompra.push(ordem);
    });

    return livroOrdens;
  }
}
