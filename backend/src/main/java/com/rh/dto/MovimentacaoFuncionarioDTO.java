package com.rh.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor
public class MovimentacaoFuncionarioDTO {
    private Long funcionarioId;
    private Long novoCargoId;
    private Long novoDepartamentoId;
    private BigDecimal novoSalario;
    private String observacao;
}
