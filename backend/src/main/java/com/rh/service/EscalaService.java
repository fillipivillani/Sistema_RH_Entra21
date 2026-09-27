package com.rh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rh.dto.AssociarFuncionarioDTO;
import com.rh.dto.EscalaDTO;
import com.rh.exception.EscalaNaoEncontradaException;
import com.rh.exception.FuncionarioNaoEncontradoException;
import com.rh.model.Escala;
import com.rh.model.Funcionario;
import com.rh.model.FuncionarioEscala;
import com.rh.repository.EscalaRepository;
import com.rh.repository.FuncionarioEscalaRepository;
import com.rh.repository.FuncionarioRepository;

import java.util.List;

@Service
public class EscalaService {

    @Autowired
    private EscalaRepository escalaRepository;

    @Autowired
    private FuncionarioEscalaRepository funcionarioEscalaRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public Escala criarEscala(EscalaDTO dto) {
        // Escala escala = new Escala(dto.getNome(), dto.getDescricao(), dto.getHorarioInicio(), dto.getHorarioFim());
        Escala escala = Escala.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .horarioInicio(dto.getHorarioInicio())
                .horarioFim(dto.getHorarioFim())
                .build();
                
        return escalaRepository.save(escala);
    }

    public List<Escala> listarEscalas() {
        return escalaRepository.findAll();
    }

    public FuncionarioEscala associarFuncionario(AssociarFuncionarioDTO dto) {
        Funcionario funcionario = funcionarioRepository.findById(dto.getFuncionarioId())
                            .orElseThrow(() -> new FuncionarioNaoEncontradoException(dto.getFuncionarioId()));

        Escala escala = escalaRepository.findById(dto.getEscalaId())
                            .orElseThrow(() -> new EscalaNaoEncontradaException(dto.getEscalaId()));

        FuncionarioEscala associacao = FuncionarioEscala.builder()
                                    .funcionario(funcionario)
                                    .escala(escala)
                                    .build();

        return funcionarioEscalaRepository.save(associacao);
    }
}