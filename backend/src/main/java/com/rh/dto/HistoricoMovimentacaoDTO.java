package com.rh.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class HistoricoMovimentacaoDTO {
    private String nomeFuncionario;
    private String cargoAnterior;
    private String cargoNovo;
    private String departamentoAnterior;
    private String departamentoNovo;
    private String salarioAnterior;
    private String salarioNovo;
    private LocalDateTime dataMovimentacao;
    private String observacao;
}
