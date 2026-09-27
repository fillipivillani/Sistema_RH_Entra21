package com.sistema.rh.repository;

import com.sistema.rh.model.FuncionarioEscala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FuncionarioEscalaRepository extends JpaRepository<FuncionarioEscala, Long> {
    List<FuncionarioEscala> findByEscalaId(Long escalaId);
    List<FuncionarioEscala> findByFuncionarioId(Long funcionarioId);
}