package com.rh.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FuncionarioDTO {
    private String nome;
    private String cpf;
    private String rg;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    private String endereco;
    private LocalDate dataAdmissao;
    private BigDecimal salario;
    private String foto;
    private Long cargoId;
    private Long departamentoId;
}
