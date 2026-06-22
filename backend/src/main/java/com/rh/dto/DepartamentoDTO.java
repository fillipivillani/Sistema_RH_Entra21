package com.rh.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartamentoDTO {
    private String nome;
    private String descricao;
    private Boolean ativo;
}
