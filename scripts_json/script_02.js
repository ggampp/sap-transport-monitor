(function() {
    // Configuração de datas
    const startDate = new Date(2025, 9, 10); // 10/out/2025
    const endDate = new Date(2025, 9, 15);   // 15/out/2025
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const allTransports = [];
  
    for (let i = 0; i < days; i++) {
      const currentDate = moment(startDate).add(i, 'days');
      const qtd = JG.integer(3, 10); // de 3 a 10 por dia
  
      for (let j = 0; j < qtd; j++) {
        allTransports.push({
          id: JG.guid(),
          requestId: `${JG.random('MAK', 'TRP', 'REQ', 'TCH')}-${_.padStart(JG.integer(1, 999), 3, '0')}`,
          system: JG.random('DEV', 'QAS', 'PRD'),
          owner: JG.random(
            'Maycon Reis',
            'Guilherme Pimentel',
            'Juliana Silva',
            'Carlos Andrade',
            'Mariana Rocha',
            'Fernando Costa',
            'Patrícia Gomes',
            'Lucas Pereira'
          ),
          status: (function() {
            const r = JG.integer(1, 100);
            if (r <= 10) return 'error';
            if (r <= 30) return 'pending';
            if (r <= 70) return 'in-progress';
            return 'done';
          })(),
          createdAt: currentDate
            .clone()
            .hour(JG.integer(8, 20))      // horário aleatório entre 8h e 20h
            .minute(JG.integer(0, 59))
            .second(JG.integer(0, 59))
            .toISOString()
        });
      }
    }
  
    return allTransports;
  })();
  