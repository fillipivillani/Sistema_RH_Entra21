package com.rh.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "departamentos")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Departamento implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;
    private String descricao;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @JsonIgnore
    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL)
    private Set<Cargo> cargos = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "departamento")
    private Set<Funcionario> funcionarios = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Departamento)) return false;
        Departamento queO = (Departamento) o;
        return id != null && id.equals(queO.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
