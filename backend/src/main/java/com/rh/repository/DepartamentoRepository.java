package com.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rh.model.Departamento;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long>{
    
}
