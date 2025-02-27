import chalk from 'chalk';
import { ProjectEnvTarget } from '../../types';
import Client from '../../util/client';
import { getEnvTargetPlaceholder } from '../../util/env/env-target';
import getArgs from '../../util/get-args';
import getInvalidSubcommand from '../../util/get-invalid-subcommand';
import getSubcommand from '../../util/get-subcommand';
import handleError from '../../util/handle-error';
import logo from '../../util/output/logo';
import { getCommandName, getPkgName } from '../../util/pkg-name';
import { getLinkedProject } from '../../util/projects/link';
import add from './add';
import ls from './ls';
import pull from './pull';
import rm from './rm';

const help = () => {
  const targetPlaceholder = getEnvTargetPlaceholder();
  console.log(`
  ${chalk.bold(`${logo} ${getPkgName()} env`)} [options] <command>

  ${chalk.dim('Commands:')}

    ls      [environment] [gitbranch]         List all variables for the specified Environment
    add     [name] [environment] [gitbranch]  Add an Environment Variable (see examples below)
    rm      [name] [environment] [gitbranch]  Remove an Environment Variable (see examples below)
    pull    [filename]                        Pull all Development Environment Variables from the cloud and write to a file [.env]

  ${chalk.dim('Options:')}

    -h, --help                     Output usage information
    -A ${chalk.bold.underline('FILE')}, --local-config=${chalk.bold.underline(
    'FILE'
  )}   Path to the local ${'`vercel.json`'} file
    -Q ${chalk.bold.underline('DIR')}, --global-config=${chalk.bold.underline(
    'DIR'
  )}    Path to the global ${'`.vercel`'} directory
    -d, --debug                    Debug mode [off]
    -t ${chalk.bold.underline('TOKEN')}, --token=${chalk.bold.underline(
    'TOKEN'
  )}        Login token

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Add a new variable to multiple Environments

      ${chalk.cyan(`$ ${getPkgName()} env add <name>`)}
      ${chalk.cyan(`$ ${getPkgName()} env add API_TOKEN`)}

  ${chalk.gray('–')} Add a new variable for a specific Environment

      ${chalk.cyan(`$ ${getPkgName()} env add <name> ${targetPlaceholder}`)}
      ${chalk.cyan(`$ ${getPkgName()} env add DB_PASS production`)}

  ${chalk.gray(
    '–'
  )} Add a new variable for a specific Environment and Git Branch

      ${chalk.cyan(
        `$ ${getPkgName()} env add <name> ${targetPlaceholder} <gitbranch>`
      )}
      ${chalk.cyan(`$ ${getPkgName()} env add DB_PASS preview feat1`)}

  ${chalk.gray('–')} Add a new Environment Variable from stdin

      ${chalk.cyan(
        `$ cat <file> | ${getPkgName()} env add <name> ${targetPlaceholder}`
      )}
      ${chalk.cyan(`$ cat ~/.npmrc | ${getPkgName()} env add NPM_RC preview`)}
      ${chalk.cyan(`$ ${getPkgName()} env add API_URL production < url.txt`)}

  ${chalk.gray('–')} Remove a variable from multiple Environments

      ${chalk.cyan(`$ ${getPkgName()} env rm <name>`)}
      ${chalk.cyan(`$ ${getPkgName()} env rm API_TOKEN`)}

  ${chalk.gray('–')} Remove a variable from a specific Environment

      ${chalk.cyan(`$ ${getPkgName()} env rm <name> ${targetPlaceholder}`)}
      ${chalk.cyan(`$ ${getPkgName()} env rm NPM_RC preview`)}

  ${chalk.gray(
    '–'
  )} Remove a variable from a specific Environment and Git Branch

      ${chalk.cyan(
        `$ ${getPkgName()} env rm <name> ${targetPlaceholder} <gitbranch>`
      )}
      ${chalk.cyan(`$ ${getPkgName()} env rm NPM_RC preview feat1`)}
`);
};

const COMMAND_CONFIG = {
  ls: ['ls', 'list'],
  add: ['add'],
  rm: ['rm', 'remove'],
  pull: ['pull'],
};

export default async function main(client: Client) {
  let argv;

  try {
    argv = getArgs(client.argv.slice(2), {
      '--yes': Boolean,
      '-y': '--yes',
    });
  } catch (error) {
    handleError(error);
    return 1;
  }

  if (argv['--help']) {
    help();
    return 2;
  }

  const { subcommand, args } = getSubcommand(argv._.slice(1), COMMAND_CONFIG);
  const { output, config } = client;
  const link = await getLinkedProject(client);
  if (link.status === 'error') {
    return link.exitCode;
  } else if (link.status === 'not_linked') {
    output.error(
      `Your codebase isn’t linked to a project on Vercel. Run ${getCommandName(
        'link'
      )} to begin.`
    );
    return 1;
  } else {
    const { project, org } = link;
    config.currentTeam = org.type === 'team' ? org.id : undefined;
    switch (subcommand) {
      case 'ls':
        return ls(client, project, argv, args, output);
      case 'add':
        return add(client, project, argv, args, output);
      case 'rm':
        return rm(client, project, argv, args, output);
      case 'pull':
        return pull(
          client,
          project,
          ProjectEnvTarget.Development,
          argv,
          args,
          output
        );
      default:
        output.error(getInvalidSubcommand(COMMAND_CONFIG));
        help();
        return 2;
    }
  }
}
