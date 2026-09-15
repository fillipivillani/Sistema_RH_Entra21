package com.rh.interfaces;

import java.time.LocalDateTime;

public interface HistoricoMovimentacaoInterface {
    String getNomeFuncionario();
    String getCargoAnterior();
    String getCargoNovo();
    String getDepartamentoAnterior();
    String getDepartamentoNovo();
    String getSalarioAnterior();
    String getSalarioNovo();
    LocalDateTime getDataMovimentacao();
    String getObservacao();
}
