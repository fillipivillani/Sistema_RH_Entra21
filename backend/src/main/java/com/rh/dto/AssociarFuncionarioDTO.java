package com.sistema.rh.dto;

public class AssociarFuncionarioDTO {
    private Long funcionarioId;
    private Long escalaId;

    public Long getFuncionarioId() { return funcionarioId; }
    public void setFuncionarioId(Long funcionarioId) { this.funcionarioId = funcionarioId; }

    public Long getEscalaId() { return escalaId; }
    public void setEscalaId(Long escalaId) { this.escalaId = escalaId; }
}