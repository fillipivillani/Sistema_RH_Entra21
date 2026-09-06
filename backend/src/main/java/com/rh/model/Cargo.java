package com.rh.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "cargos")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Cargo implements Serializable{
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;

    @Column(name = "cbo_codigo")
    private String cboCodigo;

    @Column(name = "cbo_descricao")
    private String cboDescricao;

    private String descricao;
    private Boolean ativo;

    @ManyToOne
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @JsonIgnore
    @OneToMany(mappedBy = "cargo")
    private Set<Funcionario> funcionarios = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cargo)) return false;
        Cargo cargo = (Cargo) o;
        return id != null && id.equals(cargo.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
