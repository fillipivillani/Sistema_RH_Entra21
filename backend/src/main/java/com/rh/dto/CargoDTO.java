package com.rh.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CargoDTO {
    private String nome;
    private String cboCodigo;
    private String cboDescricao;
    private String descricao;
    private Boolean ativo;
    private Long departamentoId;
}
