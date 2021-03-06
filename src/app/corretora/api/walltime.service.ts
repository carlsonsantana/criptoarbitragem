import { Injectable } from '@angular/core';

import { Corretora, LivroOrdens, Ordem, Ordens } from '../corretora';

type OrdemWalltime = Array<string>;

interface LivroOrdensWalltime {
  timestamp: number;
  'xbt-brl': Array<OrdemWalltime>;
  'brl-xbt': Array<OrdemWalltime>;
}

interface MetaWalltime {
  current_round: number;
  code_version: string;
  order_book_pages: number;
  suspended_actions: Array<any>;
  order_book_prefix: string;
  last_trades_prefix: string;
  best_offer: any;
}

@Injectable({
  providedIn: 'root'
})
export class WalltimeService extends Corretora {
  readonly UTILIZA_PROXY = true;
  readonly TAXA_ORDEM_EXECUTORA = 0.004;
  readonly TAXA_SAQUE_FIXA = 9;
  readonly TAXA_SAQUE_FIXA_BANCO_CONVENIADO = 0;
  readonly TAXA_SAQUE_VARIAVEL = 0.0123;
  readonly TAXA_SAQUE_VARIAVEL_BANCO_CONVENIADO = this.TAXA_SAQUE_VARIAVEL;
  readonly POSSUI_CONVENIOS_BANCOS = true;
  readonly LIVRO_ORDENS_VAZIO = {
    venda: [],
    compra: [],
    dataRequisicao: new Date(),
    dataResposta: new Date(),
  };

  id = 'walltime';
  nome = 'Walltime';
  paginaInicial = 'https://walltime.info/';
  paginaOrdens = 'https://walltime.info/';
  paginaContato = 'https://walltime.info/index_pt.html#!text?content=ajuda';
  observacao = '';
  webservice = (
    'https://s3.amazonaws.com/data-production-walltime-info/production/dynamic/'
    + 'meta.json'
  );
  webservice2 = (
    'https://s3.amazonaws.com/data-production-walltime-info/production/dynamic/'
    + '{order_book_prefix}_r{current_round}_p0.json'
  );
  livroOrdens: LivroOrdens;
  taxaTransferencia = 0.0005;

  constructor() {
    super();
    this.livroOrdens = null;
  }

  private async retornarLivroOrdens(): Promise<LivroOrdens> {
    const dataRequisicao = new Date();

    let response: any = await this.requisicao(this.webservice);
    if (response === this.LIVRO_ORDENS_VAZIO) {
      this.livroOrdens = this.LIVRO_ORDENS_VAZIO;
      return this.livroOrdens;
    }
    const metadata: MetaWalltime = response as MetaWalltime;

    response = await this.requisicao(
      this.webservice2.replace(
        '{order_book_prefix}',
        metadata.order_book_prefix,
      ).replace('{current_round}', metadata.current_round.toString())
    );
    if (response === this.LIVRO_ORDENS_VAZIO) {
      this.livroOrdens = this.LIVRO_ORDENS_VAZIO;
      return this.livroOrdens;
    }
    const livroOrdensWalltime: LivroOrdensWalltime = (
      response as LivroOrdensWalltime
    );

    this.livroOrdens = this.converterLivroOrdensAPI(
      livroOrdensWalltime,
      dataRequisicao
    );
    return this.livroOrdens;
  }

  private converterNumeroWalltime(numeroWalltime: string): number {
    if (numeroWalltime.indexOf('/') === -1) {
      return parseFloat(numeroWalltime);
    }
    const numeros = numeroWalltime.split('/');
    return parseFloat(numeros[0]) / parseFloat(numeros[1]);
  }

  carregarLivroOrdens(): Promise<LivroOrdens> {
    return this.retornarLivroOrdens();
  }

  converterLivroOrdensAPI(
    livroOrdensAPI: any,
    dataRequisicao: Date,
  ): LivroOrdens {
    const ordensVenda: Ordens = [];
    const ordensCompra: Ordens = [];
    const livroOrdens: LivroOrdens = {
      venda: ordensVenda,
      compra: ordensCompra,
      dataRequisicao,
      dataResposta: new Date(),
    };
    const livroOrdensWalltime: LivroOrdensWalltime = (
      livroOrdensAPI
    ) as LivroOrdensWalltime;

    livroOrdensWalltime['xbt-brl'].forEach(
      (ordemWalltime: OrdemWalltime) => {
        const quantidade = this.converterNumeroWalltime(ordemWalltime[0]);
        const ordem: Ordem = {
          preco: (this.converterNumeroWalltime(ordemWalltime[1]) / quantidade),
          quantidade,
        };
        ordensVenda.push(ordem);
      }
    );
    livroOrdensWalltime['brl-xbt'].forEach(
      (ordemWalltime: OrdemWalltime) => {
        const quantidade = this.converterNumeroWalltime(ordemWalltime[0]);
        const ordem: Ordem = {
          preco: (this.converterNumeroWalltime(ordemWalltime[1]) / quantidade),
          quantidade,
        };
        ordensCompra.push(ordem);
      }
    );

    return livroOrdens;
  }
}
