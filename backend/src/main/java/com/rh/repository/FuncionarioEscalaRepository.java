package com.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rh.model.FuncionarioEscala;

import java.util.List;

@Repository
public interface FuncionarioEscalaRepository extends JpaRepository<FuncionarioEscala, Long> {
    List<FuncionarioEscala> findByEscalaId(Long escalaId);
    List<FuncionarioEscala> findByFuncionarioId(Long funcionarioId);
}