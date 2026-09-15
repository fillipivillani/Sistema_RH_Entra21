package com.rh.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name = "movimentacoes_funcionario")
@Getter 
@Setter 
@Builder 
@AllArgsConstructor 
@NoArgsConstructor
public class MovimentacaoFuncionario implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @ManyToOne
    @JoinColumn(name = "cargo_anterior_id", nullable = false)
    private Cargo cargoAnterior;

    @ManyToOne
    @JoinColumn(name = "cargo_novo_id", nullable = false)
    private Cargo cargoNovo;

    @ManyToOne
    @JoinColumn(name = "departamento_anterior_id", nullable = false)
    private Departamento departamentoAnterior;

    @ManyToOne
    @JoinColumn(name = "departamento_novo_id", nullable = false)
    private Departamento departamentoNovo;

    @Column(name = "salario_anterior", precision = 10, scale = 2, nullable = false)
    private BigDecimal salarioAnterior;

    @Column(name = "salario_novo", precision = 10, scale = 2, nullable = false)
    private BigDecimal salarioNovo;

    @Column(length = 500)
    private String observacao;

    @Column(name = "data_movimentacao", nullable = false)
    private LocalDateTime dataMovimentacao;
}
