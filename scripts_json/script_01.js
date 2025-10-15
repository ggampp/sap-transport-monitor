JG.repeat(12, 100, {
    id: JG.guid(),
  
    requestId() {
      const prefix = JG.random('MAK', 'TRP', 'REQ', 'TCH');
      const num = _.padStart(JG.integer(1, 999), 3, '0');
      return `${prefix}-${num}`;
    },
  
    system: JG.random('DEV', 'QAS', 'PRD'),
  
    owner() {
      return JG.random(
        'Maycon Reis',
        'Guilherme Pimentel',
        'Juliana Silva',
        'Carlos Andrade',
        'Mariana Rocha',
        'Fernando Costa',
        'Patrícia Gomes',
        'Lucas Pereira'
      );
    },
  
    status() {
      // Distribuição: 10% error, 20% pending, 40% in-progress, 30% done
      const r = JG.integer(1, 100);
      if (r <= 10) return 'error';
      if (r <= 30) return 'pending';
      if (r <= 70) return 'in-progress';
      return 'done';
    },
  
    createdAt() {
      // Datas entre 10 e 15 de outubro de 2025 (ISO)
      const start = new Date(2025, 1, 10); // mês 9 = outubro
      const end = new Date(2025, 9, 15);
      return moment(JG.date(start, end)).toISOString();
    }
  });
  