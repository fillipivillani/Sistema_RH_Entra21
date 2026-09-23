package com.sistema.rh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "funcionario_escala")
public class FuncionarioEscala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "funcionario_id")
    private Long funcionarioId;

    @Column(name = "escala_id")
    private Long escalaId;

    public FuncionarioEscala() {}

    public FuncionarioEscala(Long funcionarioId, Long escalaId) {
        this.funcionarioId = funcionarioId;
        this.escalaId = escalaId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFuncionarioId() { return funcionarioId; }
    public void setFuncionarioId(Long funcionarioId) { this.funcionarioId = funcionarioId; }

    public Long getEscalaId() { return escalaId; }
    public void setEscalaId(Long escalaId) { this.escalaId = escalaId; }
}