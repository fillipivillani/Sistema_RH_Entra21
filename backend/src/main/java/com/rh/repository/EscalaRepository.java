package com.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rh.model.Escala;

@Repository
public interface EscalaRepository extends JpaRepository<Escala, Long> {
}