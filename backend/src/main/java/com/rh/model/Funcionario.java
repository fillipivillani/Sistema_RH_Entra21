package com.rh.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

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
@Getter
@Setter
@Builder
@Table(name = "funcionarios")
@AllArgsConstructor
@NoArgsConstructor
public class Funcionario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(length = 20)
    private String rg;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(length = 20)
    private String telefone;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 255)
    private String endereco;

    @Column(name = "data_admissao", nullable = false)
    private LocalDate dataAdmissao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salario;

    // Guarda apenas o nome ou o caminho do arquivo estático
    @Column(name = "foto", length = 255)
    private String foto;

    @ManyToOne
    @JoinColumn(name = "cargo_id", nullable = false)
    private Cargo cargo;

    @ManyToOne
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Builder.Default
    @Column(nullable = false)
    private Boolean status = true;
}
