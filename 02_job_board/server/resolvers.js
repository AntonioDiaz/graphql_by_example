const db = require('./db');

const Query = {
    company: (root, {id}) => db.companies.get(id),
    job: (root, {id}) => db.jobs.get(id),
    jobs: () => db.jobs.list()
};

const Job = {
    company: (job) => db.companies.get(job.companyId)
};

const Company = {
    jobs: (company) => db.jobs.list().filter((job) => job.companyId === company.id)
}

module.exports = { Query, Job, Company };