package com.rh.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rh.dto.CargoDTO;
import com.rh.exception.CargoNaoEncontradoException;
import com.rh.exception.DepartamentoNaoEncontradoException;
import com.rh.model.Cargo;
import com.rh.model.Departamento;
import com.rh.repository.CargoRepository;
import com.rh.repository.DepartamentoRepository;

@Service
public class CargoService {

    @Autowired
    private CargoRepository cargoRepository;
    
    @Autowired
    private DepartamentoRepository departamentoRepository;

    public Cargo cadastrarCargo(CargoDTO dto) {
        Departamento departamento = departamentoRepository.findById(dto.getDepartamentoId())
                        .orElseThrow(() -> new DepartamentoNaoEncontradoException(dto.getDepartamentoId()));

        Cargo cargo = new Cargo().builder()
            .nome(dto.getNome())
            .cboCodigo(dto.getCboCodigo())
            .cboDescricao(dto.getDescricao())
            .descricao(dto.getDescricao())
            .ativo(dto.getAtivo())
            .departamento(departamento)
            .build();

        return cargoRepository.save(cargo);
    }

    public List<Cargo> buscarTodos() {
        return cargoRepository.findAll();
    }

    public Cargo buscarCargoPorId(Long id) {
        return cargoRepository.findById(id)
                .orElseThrow(() -> new CargoNaoEncontradoException(id));
    }

    public Cargo editarCargo(CargoDTO dto, Long id) {
        Cargo cargo = cargoRepository.findById(id)
                        .orElseThrow(() -> new CargoNaoEncontradoException(id));

        Departamento departamento = departamentoRepository.findById(dto.getDepartamentoId())
                        .orElseThrow(() -> new DepartamentoNaoEncontradoException(dto.getDepartamentoId()));

        cargo.setNome(dto.getNome());
        cargo.setCboCodigo(dto.getCboCodigo());
        cargo.setCboDescricao(dto.getDescricao());
        cargo.setDescricao(dto.getDescricao());
        cargo.setAtivo(dto.getAtivo());
        cargo.setDepartamento(departamento);

        return cargoRepository.save(cargo);
    }

    public void deletarCargo(Long id) {
        Cargo cargo = cargoRepository.findById(id)
                        .orElseThrow(() -> new CargoNaoEncontradoException(id));

        cargoRepository.delete(cargo);
    }
}
