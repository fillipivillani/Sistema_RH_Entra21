package com.rh.service;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.rh.dto.DepartamentoDTO;
import com.rh.exception.DepartamentoNaoEncontradoException;
import com.rh.model.Departamento;
import com.rh.repository.DepartamentoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;

    public Departamento cadastrarDepartamento(DepartamentoDTO dto) {
        Departamento departamento = new Departamento();
        BeanUtils.copyProperties(dto, departamento);
        return departamentoRepository.save(departamento);
    }
    
    public List<Departamento> buscarTudo() {
        return departamentoRepository.findAll();
    }

    public Departamento buscarDepartamentoPorId(Long id) {
        return departamentoRepository.findById(id)
                .orElseThrow(() -> new DepartamentoNaoEncontradoException(id));
    }

    public Departamento editarDepartamento(DepartamentoDTO dto, Long id) {
        Departamento departamento = departamentoRepository.findById(id)
                                .orElseThrow(() -> new DepartamentoNaoEncontradoException(id));

        BeanUtils.copyProperties(dto, departamento);
        return departamentoRepository.save(departamento);
    }

    public void deletarDepartamento(Long id) {
        Departamento departamento = departamentoRepository.findById(id)
                                .orElseThrow(() -> new DepartamentoNaoEncontradoException(id));

        departamentoRepository.delete(departamento);
    }
}
