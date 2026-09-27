package com.sistema.rh.service;

import com.sistema.rh.dto.AssociarFuncionarioDTO;
import com.sistema.rh.dto.EscalaDTO;
import com.sistema.rh.model.Escala;
import com.sistema.rh.model.FuncionarioEscala;
import com.sistema.rh.repository.EscalaRepository;
import com.sistema.rh.repository.FuncionarioEscalaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EscalaService {

    @Autowired
    private EscalaRepository escalaRepository;

    @Autowired
    private FuncionarioEscalaRepository funcionarioEscalaRepository;

    public Escala criarEscala(EscalaDTO dto) {
        Escala escala = new Escala(dto.getNome(), dto.getDescricao(), dto.getHorarioInicio(), dto.getHorarioFim());
        return escalaRepository.save(escala);
    }

    public List<Escala> listarEscalas() {
        return escalaRepository.findAll();
    }

    public FuncionarioEscala associarFuncionario(AssociarFuncionarioDTO dto) {
        FuncionarioEscala associacao = new FuncionarioEscala(dto.getFuncionarioId(), dto.getEscalaId());
        return funcionarioEscalaRepository.save(associacao);
    }
}